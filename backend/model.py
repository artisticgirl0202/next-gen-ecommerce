import numpy as np

# placeholder: load or create small random weights
np.random.seed(42)
WEIGHTS = np.random.randn(10)  # example

def featurize(user_hist, candidate):
    # user_hist: list of item_ids (ints), candidate: item dict
    # create a toy feature vector length 10
    vec = np.zeros(10)
    vec[0] = len(user_hist)
    vec[1] = candidate.get("price", 0) / 1000.0
    # add some pseudo features from ids
    vec[2:] = (np.array([int(candidate.get("id",0)) % 100 + i for i in range(8)]) % 10) / 10.0
    return vec

def score(candidate, user_hist):
    x = featurize(user_hist, candidate)
    return float(np.dot(WEIGHTS, x))
