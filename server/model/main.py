import os

import kagglehub
import numpy as np
import torch

path = kagglehub.dataset_download("rajgupta2019/medical-insurance-dataset")

print("Files in dataset:", os.listdir(path))

train_data = torch.from_numpy(
    np.genfromtxt(os.path.join(path, "Train_Data.csv"), delimiter=",")
)

test_data = torch.from_numpy(
    np.genfromtxt(os.path.join(path, "Test_Data.csv"), delimiter=",")
)

print(test_data)
