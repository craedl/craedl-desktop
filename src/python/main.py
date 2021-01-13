import craedl
import sys

def main():
    fxn = sys.argv[1]
    if fxn == 'auth':
        authenticate()
    elif fxn == 'conf':
        token = sys.argv[2]
        configure(token)
    elif fxn == 'sync':
        path = sys.argv[2]
        url = sys.argv[3]
        sync(path, url)

def authenticate():
    sys.argv = [sys.argv[0]]
    try:
        profile = craedl.auth()
    except:
        raise
    else:
        print('success', flush=True)

def configure(token):
    sys.argv = [sys.argv[0]]
    try:
        craedl.configure(token)
    except:
        raise
    else:
        print('success', flush=True)

def sync(path, url):
    sys.argv = [sys.argv[0]]
    ids = url.split('/')[-1]
    split_ids = ids.split('?d=')
    if len(split_ids) > 1:
        directory = craedl.core.Directory(split_ids[1])
    else:
        directory = craedl.core.Project(split_ids[0]).get_data()
    try:
        directory = directory.upload_directory(path, output=True)
    except:
        raise
    else:
        print('success', flush=True)

if __name__ == "__main__":
    main()