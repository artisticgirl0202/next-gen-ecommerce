# backend/services/data.py
import os
import json
import numpy as np
from threading import Lock
from embedding import load_products, load_embeddings
from recommender import FaissIndex  # make sure recommender.FaissIndex exists

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "..", "data")
INTERACTIONS_FILE = os.path.join(DATA_DIR, "interactions.json")

data_lock = Lock()

# Load products and mappings
PRODUCTS = load_products()
prod_id_to_idx = {p["id"]: i for i, p in enumerate(PRODUCTS)}
idx_to_prod = {i: p for i, p in enumerate(PRODUCTS)}

# Load embeddings safely
try:
    EMBEDDINGS = load_embeddings()
except Exception:
    EMBEDDINGS = None

# Build Faiss index if embeddings available
FAISS_INDEX = FaissIndex(EMBEDDINGS) if EMBEDDINGS is not None else None

# Collab similarity matrix (optional). Initialize to None and build elsewhere.
COLLAB_SIM = None

def load_interactions():
    if not os.path.exists(INTERACTIONS_FILE):
        return {}
    with open(INTERACTIONS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_interactions(data):
    with open(INTERACTIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def build_collab_sim():
    """
    Build item-item collaborative similarity matrix from disk interactions.
    Returns an (N, N) numpy array or None.
    """
    interactions = load_interactions()
    users = sorted(interactions.keys(), key=lambda x: int(x) if str(x).isdigit() else x)
    if not users:
        return np.zeros((len(PRODUCTS), len(PRODUCTS)), dtype=np.float32)
    user_to_idx = {u: i for i, u in enumerate(users)}
    item_user = np.zeros((len(PRODUCTS), len(users)), dtype=np.float32)
    for u, items in interactions.items():
        ui = user_to_idx[u]
        for pid in items:
            if pid in prod_id_to_idx:
                item_user[prod_id_to_idx[pid], ui] += 1.0
    norms = np.linalg.norm(item_user, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    collab_sim = (item_user @ item_user.T) / (norms @ norms.T)
    return collab_sim

def init_collab_sim():
    """Call at startup or after interactions update to initialize global COLLAB_SIM."""
    global COLLAB_SIM
    try:
        COLLAB_SIM = build_collab_sim()
    except Exception:
        COLLAB_SIM = None

def get_collab_sim_safe(idx, idxs):
    """
    Return collab similarity scores for item idx against candidate indices idxs.
    If COLLAP_SIM is not available, returns zeros of appropriate length.
    """
    try:
        global COLLAB_SIM
        if COLLAB_SIM is None:
            return np.zeros(len(idxs), dtype=np.float32)
        # ensure idxs is a numpy array of ints
        idxs_arr = np.array(idxs, dtype=int)
        return COLLAB_SIM[idx, idxs_arr]
    except Exception:
        return np.zeros(len(idxs), dtype=np.float32)

# initialize collab sim at import time if desired
try:
    init_collab_sim()
except Exception:
    # ignore initialization errors here; can be initialized later
    pass
