# backend/embedding.py
import os
import json
import numpy as np

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
PRODUCTS_FILE = os.path.join(DATA_DIR, "products.json")
EMBED_FILE = os.path.join(DATA_DIR, "product_embeddings.npy")

# try to import sentence_transformers (preferred)
try:
    from sentence_transformers import SentenceTransformer
    _HAS_STS = True
except Exception:
    SentenceTransformer = None
    _HAS_STS = False

# fallback: scikit-learn TF-IDF + TruncatedSVD
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.decomposition import TruncatedSVD
    _HAS_SK = True
except Exception:
    TfidfVectorizer = None
    TruncatedSVD = None
    _HAS_SK = False

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
_model = None

def _get_sentence_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    return _model

def load_products():
    if not os.path.exists(PRODUCTS_FILE):
        return []
    with open(PRODUCTS_FILE, "r", encoding="utf-8") as f:
        products = json.load(f)
    for p in products:
        p["categories"] = [str(c) for c in p.get("categories", [])]
    return products

def build_embeddings(save=True, normalize=True, batch_size=32, svd_dim=128):
    """
    Build embeddings for products. Preferred: sentence-transformers.
    Fallback: TF-IDF + TruncatedSVD (fast, CPU-only).
    Returns: np.ndarray (N, D) dtype float32
    """
    products = load_products()
    texts = []
    for p in products:
        text = " ".join([
            str(p.get("name", "")),
            str(p.get("brand", "")),
            " ".join(p.get("categories", [])),
            str(p.get("description", "")),
        ]).strip()
        texts.append(text)

    if _HAS_STS:
        # use sentence-transformers
        model = _get_sentence_model()
        emb = model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=True,
            convert_to_numpy=True,
        )
        emb = np.array(emb, dtype=np.float32)
    elif _HAS_SK:
        # lightweight fallback
        vec = TfidfVectorizer(max_features=20000, ngram_range=(1,2))
        X = vec.fit_transform(texts)
        if X.shape[1] <= svd_dim:
            # small feature space: convert dense directly
            emb = X.toarray().astype(np.float32)
        else:
            svd = TruncatedSVD(n_components=svd_dim, random_state=42)
            emb = svd.fit_transform(X).astype(np.float32)
    else:
        # last resort: bag-of-chars hashing (very simple, deterministic)
        N = len(texts)
        if N == 0:
            emb = np.empty((0, 0), dtype=np.float32)
        else:
            D = svd_dim
            emb = np.zeros((N, D), dtype=np.float32)
            for i, t in enumerate(texts):
                for j, ch in enumerate(t.encode("utf-8")[:1024]):
                    emb[i, j % D] += ch / 255.0

    # normalize if requested
    if normalize and emb.size != 0:
        norms = np.linalg.norm(emb, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        emb = emb / norms

    if save:
        try:
            os.makedirs(DATA_DIR, exist_ok=True)
            np.save(EMBED_FILE, emb)
        except Exception as e:
            print("[WARN] failed to save embeddings:", e)

    return emb

def load_embeddings():
    """
    Return embeddings ndarray (N, D). If file missing, try to build.
    Always returns np.ndarray (maybe shape (0,0)).
    """
    if os.path.exists(EMBED_FILE):
        try:
            emb = np.load(EMBED_FILE)
            if emb.ndim == 2:
                return emb.astype("float32")
        except Exception as e:
            print("[WARN] failed to load existing embeddings:", e)

    # fallback: attempt to build (may be slow)
    try:
        emb = build_embeddings(save=True)
        return emb.astype("float32")
    except Exception as e:
        print("[ERROR] build_embeddings failed:", e)
        return np.empty((0, 0), dtype=np.float32)
