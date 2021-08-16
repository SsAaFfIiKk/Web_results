import os
import zipfile
import json


def create_folders(path_to_dir, file_name):
    path_to_save = os.path.join(path_to_dir, file_name)
    if not os.path.exists(path_to_save):
        os.mkdir(path_to_save)
    return path_to_save + "/"


def unpack_archive(file_name, path_to_save, support_ext):
    with zipfile.ZipFile(os.path.join(path_to_save, file_name)) as f:
        for file in f.namelist():
            ext = file.split(".")[-1]
            if ext in support_ext:
                f.extract(file, path_to_save)



def load_json(path):
    with open(path) as f:
        data = json.load(f)
    return data