"use strict";

////////////////////---------- SELECTING ELEMENTS ----------\\\\\\\\\\\\\\\\\\\\

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

////////////////////---------- WORKOUT MODEL ----------\\\\\\\\\\\\\\\\\\\\

class Workout {
  #date = new Date();

  id = Date.now();

  constructor(distance, duration, coordinates) {
    this.distance = distance;
    this.duration = duration;
    this.coordinates = coordinates;
  }

  _setTitle() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.title = `${this.type[0].toUpperCase() + this.type.slice(1)} on ${
      months[this.#date.getMonth()]
    } ${this.#date.getDate()}, ${this.#date.getFullYear()}`;
  }
}

class Running extends Workout {
  type = "running";

  constructor(distance, duration, coordinates, cadence) {
    super(distance, duration, coordinates);
    this.cadence = cadence;
    this._setTitle();
    this.#calculatePace();
  }

  #calculatePace() {
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workout {
  type = "cycling";

  constructor(distance, duration, coordinates, elevation) {
    super(distance, duration, coordinates);
    this.elevation = elevation;
    this._setTitle();
    this.#calculateSpeed();
  }

  #calculateSpeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}

////////////////////---------- APPLICATION LOGIC ----------\\\\\\\\\\\\\\\\\\\\

class Application {
  #map;
  #mapEvent;
  #workouts = [];
  #mapZoom = 13;

  constructor() {
    this.#getCurrentPosition();

    inputType.addEventListener("change", this.#toggleElevationAndCadenceField);
    form.addEventListener("submit", this.#addWorkout.bind(this));
    containerWorkouts.addEventListener("click", this.#goToWorkoutPopup.bind(this));
  }

  #getCurrentPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.#loadMap.bind(this), function () {
        alert("You need to accept location sharing");
      });
    }
  }

  #loadMap(position) {
    const { latitude, longitude } = position.coords;

    this.#map = L.map("map").setView([latitude, longitude], this.#mapZoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this.#showForm.bind(this));
  }

  #showForm(mapEvent) {
    this.#mapEvent = mapEvent;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  #hideForm() {
    inputDistance.value = inputDuration.value = inputElevation.value = inputCadence.value = "";

    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }

  #toggleElevationAndCadenceField() {
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  }

  #addWorkout(e) {
    e.preventDefault();

    const checkPositiveInputs = (...inputs) => inputs.every(input => input > 0);

    const type = inputType.value;
    const distance = Number(inputDistance.value);
    const duration = Number(inputDuration.value);
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    if (type === "running") {
      const cadence = Number(inputCadence.value);

      if (checkPositiveInputs(distance, duration, cadence))
        workout = new Running(distance, duration, [lat, lng], cadence);
      else return alert("Inputs have to be positive numbers!");
    }

    if (type === "cycling") {
      const elevation = Number(inputElevation.value);

      if (checkPositiveInputs(distance, duration) && Number.isFinite(elevation))
        workout = new Cycling(distance, duration, [lat, lng], elevation);
      else return alert("Inputs have to be positive numbers!");
    }

    this.#workouts.push(workout);
    this.#displayWorkoutOnList(workout);
    this.#displayWorkoutMarkerOnMap(workout);
    this.#hideForm();
  }

  #displayWorkoutOnList(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.title}</h2>
      <div class="workout__details">
        <span class="workout__icon">🏃‍♂️</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
    `;

    if (workout.type === "running") {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;
    }

    if (workout.type === "cycling") {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevation}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;
    }

    form.insertAdjacentHTML("afterend", html);
  }

  #displayWorkoutMarkerOnMap(workout) {
    L.marker(workout.coordinates)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}--popup`,
        })
      )
      .setPopupContent(`${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.title}`)
      .openPopup();
  }

  #goToWorkoutPopup(e) {
    const workoutElement = e.target.closest(".workout");

    if (!this.#map || !workoutElement) return;

    const workout = this.#workouts.find(workout => workout.id === +workoutElement.dataset.id);

    this.#map.setView(workout.coordinates, this.#mapZoom, { animate: true, duration: 1 });
  }
}

new Application();
