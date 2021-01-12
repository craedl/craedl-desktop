import craedl

def main():
    try:
        profile = craedl.auth()
    except:
        raise
    else:
        print('success', flush=True)

if __name__ == "__main__":
    main()