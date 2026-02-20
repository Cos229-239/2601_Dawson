const landing = document.getElementById("landing");
const mapScreen = document.getElementById("mapScreen");
const devButton = document.getElementById("dev");

devButton.addEventListener("click", () => {
    landing.style.display = "none";
    mapScreen.style.display = "block";
});