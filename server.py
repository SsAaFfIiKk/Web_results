import json
import uvicorn
from fastapi import FastAPI, Request, Form
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import FileResponse, HTMLResponse


def load_json(path):
    with open(path) as f:
        data = json.load(f)
    return data


app = FastAPI()
app.mount("/css", StaticFiles(directory="./css"), name="css")
app.mount("/js", StaticFiles(directory="./js"), name="js")
templates = Jinja2Templates(directory="html")

path_to_json = "res.json"
path_to_kv = "kv.json"

data = load_json(path_to_json)
kv = load_json(path_to_kv)


temps = []
time_lst = []

for i in data:
    temps += i[8]


@app.get("/get_len_data")
def get_len():
    return len(data)


@app.get("/get_all_temps")
def temps():
    return temps


@app.get("/get_kv")
def get_kv():
    return kv


@app.get("/get_data")
def get(id: int):
    return data[id]


@app.get("/", response_class=HTMLResponse)
def homepage(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/get_video")
def video(path: str):
    return FileResponse(path)


@app.post("/timestamp")
def timestamp(time: str = Form(...)):
    time_lst.append(time)


if __name__ == "__main__":
    uvicorn.run(app)
