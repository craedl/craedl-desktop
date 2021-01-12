import craedl
import sys

def main():
    token = sys.argv[1]
    del sys.argv[1]
    try:
        craedl.configure(token)
    except:
        raise
    else:
        print('success', flush=True)

if __name__ == "__main__":
    main()