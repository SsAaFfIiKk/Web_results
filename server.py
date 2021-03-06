import shutil
import uvicorn
from fastapi import FastAPI, Request, Form, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import FileResponse, HTMLResponse
from tools import *


app = FastAPI()
app.mount("/css", StaticFiles(directory="./css"), name="css")
app.mount("/js", StaticFiles(directory="./js"), name="js")
templates = Jinja2Templates(directory="html")

path_to_json = "res.json"
path_to_kv = "kv.json"
path_to_storage = "save_folder/"

data = load_json(path_to_json)
kv = load_json(path_to_kv)

temps = []
speechs = []
time_lst = []
file_extensions = ["mp4", "txt"]

for i in data:
    temps += i[8]
    speechs += i[6]


@app.get("/get_len_dat")
def get_len():
    return len(data)


@app.get("/get_all_temps")
def tm():
    return temps


@app.get("/get_all_speechs")
def sp():
    return speechs


@app.get("/get_borders")
def borders():
    return kv[1], kv[2]


@app.get("/get_kv")
def get_kv():
    return kv


@app.get("/get_dat")
def get(id: int):
    return data[id]


@app.get("/res", response_class=HTMLResponse)
def homepage(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/get_vid")
def video(path: str):
    return FileResponse("./" + path)


@app.get("/get_truth_graf")
def truth():
    return FileResponse("graf.jpg")

# @app.post("/timestamp")
# def timestamp(time: str = Form(...)):
#     time_lst.append(time)


@app.post("/save_to_analyze")
def save(file: UploadFile = File(...)):
    file_name = file.filename
    if file_name.endswith(".zip"):
        path_to_save = create_folders(path_to_storage, file_name.split(".")[0])

        with open(path_to_save + file_name, "wb") as archive:
            shutil.copyfileobj(file.file, archive)
        unpack_archive(file_name, path_to_save, file_extensions)

        return "Архив сохранён"

    else:
        return "Загруженный файл не архив"


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=1991, ssl_keyfile="./certs/privkey.pem", ssl_certfile="./certs/cert.pem")
