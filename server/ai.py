import torch
from torch import nn

device = (
    "cuda"
    if torch.cuda.is_available()
    else "mps" if torch.backends.mps.is_available() else "cpu"
)


class NeuralNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        self.flatten = nn.Flatten()
        self.linear_relu_stack = nn.Sequential(
            nn.Linear(6, 36), nn.ReLU(), nn.Linear(36, 12), nn.ReLU(), nn.Linear(12, 1)
        )

    def forward(self, x):
        x = self.flatten(x)
        logits = self.linear_relu_stack(x)
        return logits


model = NeuralNetwork().to(device)
model.load_state_dict(torch.load("./model/model.pth"))
model.eval()


def make_prediction(
    age: int, bmi: float, smoker: bool, children: int, is_male: bool
) -> float:
    data = torch.tensor([[age, bmi, smoker, children, is_male, not is_male]]).to(device)
    output = model(data)
    return output.item()
