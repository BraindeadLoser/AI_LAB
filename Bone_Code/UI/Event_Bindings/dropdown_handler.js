export function bindDropdownHandler() {

    document.addEventListener(
        "click",
        (e) => {

            if (
                !e.target.closest(
                    ".dropdown-menu"
                ) &&
                !e.target.closest(
                    "button"
                )
            ) {

                document
                    .querySelectorAll(
                        ".dropdown-menu"
                    )
                    .forEach((menu) => {

                        menu.style.display =
                            "none";
                    });
            }
        }
    );
}