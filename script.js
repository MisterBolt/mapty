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
