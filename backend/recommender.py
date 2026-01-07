# backend/recommender.py
import numpy as np
import threading
from typing import List, Tuple, Optional

try:
    import faiss
except Exception:
    faiss = None

class FaissIndex:
    def __init__(self, embeddings: Optional[np.ndarray]):
        self.embeddings = embeddings
        self.lock = threading.Lock()
        self.index = None
        if embeddings is None or embeddings.size == 0:
            return
        if faiss is not None:
            dim = embeddings.shape[1]
            self.index = faiss.IndexFlatIP(dim)
            self.index.add(embeddings.astype("float32"))

    def search(self, vector: np.ndarray, top_k: int = 10) -> Tuple[List[int], List[float]]:
        if self.index is not None:
            v = vector.reshape(1, -1).astype("float32")
            with self.lock:
                D, I = self.index.search(v, top_k + 1)  # +1 to allow self-filter
            idxs = [int(i) for i in I[0] if i >= 0]
            scores = D[0][:len(idxs)].tolist()
            return idxs, scores

        # fallback: brute-force dot product (works for small dataset)
        if self.embeddings is None or self.embeddings.size == 0:
            return [], []
        vec = vector.reshape(-1)
        dots = self.embeddings @ vec
        # get top_k+1 indices sorted by dot desc
        order = np.argsort(-dots)[: top_k + 1]
        idxs = [int(i) for i in order if i >= 0]
        scores = [float(dots[i]) for i in idxs]
        return idxs, scores

# very small DIN placeholder (keeps API)
class DINReRanker:
    def __init__(self, emb_dim: int = 128):
        self.emb_dim = emb_dim

    def score(self, candidate_vecs: np.ndarray, hist_vecs: Optional[np.ndarray]):
        # if no history, return zeros so combine_scores can handle
        if hist_vecs is None or len(hist_vecs) == 0:
            return np.zeros(candidate_vecs.shape[0])
        # simple heuristic: dot with mean(hist)
        ctx = np.mean(hist_vecs, axis=0)
        return candidate_vecs @ ctx
