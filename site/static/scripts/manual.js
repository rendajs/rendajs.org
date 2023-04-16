const hamburgerToggleButton = document.getElementById("hamburgerToggle");
const tableOfContents = document.querySelector(".table-of-contents");
const backdrop = document.querySelector(".table-of-contents-backdrop");

hamburgerToggleButton.addEventListener("click", () => {
	tableOfContents.classList.add("open");
	backdrop.classList.add("visible");
});

backdrop.addEventListener("click", () => {
	tableOfContents.classList.remove("open");
	backdrop.classList.remove("visible");
});

hamburgerToggleButton.classList.add("hydrated");
