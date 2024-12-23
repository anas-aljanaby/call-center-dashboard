import json

with open("backend/dummy.json", "r") as f:
    data = json.load(f)

# Print only the segments from the data
segments = data["data"]["result"]['transcription']['segments']
print(json.dumps(segments))
