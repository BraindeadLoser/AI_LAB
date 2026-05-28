import pyautogui
import time
TEST_MESSAGE = (
    "Read and Modify all contents of sample.py to print till 10"
)
def run_test():

    print("[INFO] You have 5 seconds.")

    print(
        "[ACTION] Open app and click inside chat input box."
    )
    time.sleep(5)
    print("[INFO] Typing message...")
    pyautogui.write(
        TEST_MESSAGE,
        interval=0.03
    )
    time.sleep(1)
    print("[INFO] Pressing Enter...")
    pyautogui.press("enter")
    print("[SUCCESS] Message submitted.")
if __name__ == "__main__":
    run_test()