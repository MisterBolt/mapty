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

  constructor(distance, duration, coordinates, elevationRise) {
    super(distance, duration, coordinates);
    this.elevationRise = elevationRise;
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

  constructor() {
    this.#getCurrentPosition();

    inputType.addEventListener("change", this.#toggleElevationAndCadenceField);
    form.addEventListener("submit", this.#addWorkout.bind(this));
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

    this.#map = L.map("map").setView([latitude, longitude], 13);

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
    form.classList.add("hidden");
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

    this.#hideForm();

    console.log(workout);
  }
}

new Application();
