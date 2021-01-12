import craedl
import sys

def main():
    path = sys.argv[1]
    url = sys.argv[2]
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