import { Project } from "./project.js";
import { Note, ComplexNote } from "./note.js";

// #region TODOList class
class TODOList {
  constructor() {
    this.projects = [];
  }
  addProject(project) {
    this.projects.push(project);
  }
  removeProject(project) {
    this.projects = this.projects.filter((p) => p !== project);
  }
  // #region Render methods
  renderProjects() {
    projectList.innerHTML = "";
    this.projects.forEach((project) => {
      const projectTemplateClone = projectTemplate.content.cloneNode(true);
      projectTemplateClone.querySelector(".project-title").textContent =
        project.name;
      projectTemplateClone.querySelector(".project-description").textContent =
        project.description;
      this.renderNotes(project, projectTemplateClone);

      projectTemplateClone
        .querySelector(".create-note-button")
        .addEventListener("click", () => {
          noteDialog.dataset.currentProject = this.projects.indexOf(project); // Guarda el índice del proyecto
          noteDialog.showModal();
        });

      projectTemplateClone
        .querySelector(".delete-project-button")
        .addEventListener("click", () => {
          this.removeProject(project);
          this.renderProjects();
          saveData();
        });

      projectList.appendChild(projectTemplateClone);
    });
  }

  renderNotes(project, projectTemplateClone) {
    const noteList = projectTemplateClone.querySelector(".note-list");

    project.notes.forEach((note) => {
      let noteTemplateClone;

      if (note instanceof ComplexNote) {
        noteTemplateClone = complexNoteTemplate.content.cloneNode(true);
        noteTemplateClone.querySelector(".note-description").textContent =
          note.description;
      } else {
        noteTemplateClone = noteTemplate.content.cloneNode(true);
      }

      const noteElement = noteTemplateClone.querySelector(".note");
      noteElement.querySelector(".note-title").textContent = note.title;

      const deleteButton = noteElement.querySelector(".delete-note-button");
      if (deleteButton) {
        deleteButton.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevenir que el evento se propague
          project.removeNote(note);
          this.renderProjects();
          saveData();
        });
      }

      if (note.color) {
        noteElement.style.border = `2px solid ${note.color}`;
        noteElement.style.boxShadow = `0 0 10px ${note.color}`;
      }

      noteList.appendChild(noteTemplateClone);
    });
  }
}
// #region Constants
const container = document.querySelector(".container");
const projectSection = document.querySelector(".project-section");
const fontSelect = document.getElementById("fontSelect");

const bodyColorInput = document.getElementById("bodyColor");
const containerColorInput = document.getElementById("containerColor");

const todoList = new TODOList();
const createProjectButton = document.getElementById("createProjectButton");
const projectList = document.getElementById("projectList");

const projectDialog = document.getElementById("projectDialog");
const projectForm = document.getElementById("projectForm");

const projectTemplate = document.getElementById("projectTemplate");
const noteTemplate = document.getElementById("noteTemplate");
const complexNoteTemplate = document.getElementById("complexNoteTemplate");

const noteDialog = document.getElementById("noteDialog");
const noteDescriptionCheckbox = document.getElementById("noteDescription");
const noteForm = document.getElementById("noteForm");

const descriptionField = document.createElement("div");
descriptionField.innerHTML = `
  <label for="noteDescriptionText">Descripción</label>
  <textarea name="noteDescriptionText" id="noteDescriptionText"></textarea>
`;
descriptionField.style.display = "none";
noteForm.insertBefore(descriptionField, noteForm.querySelector("button"));

noteDescriptionCheckbox.addEventListener("change", (event) => {
  descriptionField.style.display = event.target.checked ? "block" : "none";
});

createProjectButton.addEventListener("click", () => {
  projectDialog.showModal();
});

// #region Event listeners
fontSelect.addEventListener("change", (event) => {
  const font = event.target.value;
  projectSection.style.fontFamily = font;
  localStorage.setItem("selectedFont", font);
});

bodyColorInput.addEventListener("input", (event) => {
  const color = event.target.value;
  document.body.style.backgroundColor = color;
  localStorage.setItem("bodyBackgroundColor", color);
});

containerColorInput.addEventListener("input", (event) => {
  const color = event.target.value;
  container.style.backgroundColor = color;
  localStorage.setItem("containerBackgroundColor", color);
});

projectForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(projectForm);
  const name = formData.get("projectName");
  const description = formData.get("projectDescription");
  const project = new Project(name, description, []);
  todoList.addProject(project);
  projectDialog.close();
  todoList.renderProjects();
  console.log(`Project created: ${project}`);
  saveData();
});

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(noteForm);
  const title = formData.get("noteTitle");
  const color = formData.get("noteColor");
  const isComplex = noteDescriptionCheckbox.checked;
  const projectIndex = noteDialog.dataset.currentProject;

  let note;
  if (isComplex) {
    const description = formData.get("noteDescriptionText");
    note = new ComplexNote(title, color, false, description);
  } else {
    note = new Note(title, color, false);
  }

  todoList.projects[projectIndex].addNote(note);
  noteDialog.close();
  noteForm.reset();
  descriptionField.style.display = "none";
  todoList.renderProjects();
  saveData();
});

const allNotes = document.querySelectorAll(".note");
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("note")) {
    if (event.target.classList.contains("note-inset")) {
      event.target.classList.remove("note-inset");
      event.target.classList.add("note-normal");
      event.target.classList.remove("note-completed");
    } else {
      event.target.classList.remove("note-normal");
      event.target.classList.add("note-inset");
      event.target.classList.add("note-completed");
    }
  }
});

document.querySelectorAll(".animated-text").forEach((text) => {
  let letters = text.textContent.split("");
  text.textContent = "";
  letters.forEach((letter) => {
    let span = document.createElement("span");
    span.textContent = letter;
    text.appendChild(span);
  });
});

// #region LocalStorage
function saveData() {
  const projectsData = todoList.projects.map((project) => ({
    name: project.name,
    description: project.description,
    notes: project.notes.map((note) => {
      const baseNote = {
        type: note instanceof ComplexNote ? "complex" : "simple",
        title: note.title,
        color: note.color,
        complete: note.complete,
      };

      if (note instanceof ComplexNote) {
        baseNote.description = note.description;
      }

      return baseNote;
    }),
  }));

  localStorage.setItem("todoList", JSON.stringify(projectsData));
}

function loadData() {
  const data = localStorage.getItem("todoList");
  if (data) {
    const projectsData = JSON.parse(data);
    projectsData.forEach((projData) => {
      const project = new Project(projData.name, projData.description, []);

      if (projData.notes && Array.isArray(projData.notes)) {
        projData.notes.forEach((noteData) => {
          let note;
          if (noteData.type === "complex") {
            note = new ComplexNote(
              noteData.title,
              noteData.color,
              noteData.complete,
              noteData.description
            );
          } else {
            note = new Note(noteData.title, noteData.color, noteData.complete);
          }
          project.addNote(note);
        });
      }

      todoList.addProject(project);
    });
  }
}

window.addEventListener("load", () => {
  loadData();
  todoList.renderProjects();

  const savedBodyColor = localStorage.getItem("bodyBackgroundColor");
  if (savedBodyColor) {
    document.body.style.backgroundColor = savedBodyColor;
    bodyColorInput.value = savedBodyColor;
  }

  const savedContainerColor = localStorage.getItem("containerBackgroundColor");
  if (savedContainerColor) {
    container.style.backgroundColor = savedContainerColor;
    containerColorInput.value = savedContainerColor;
  }

  const savedFont = localStorage.getItem("selectedFont");
  if (savedFont) {
    projectSection.style.fontFamily = savedFont;
    fontSelect.value = savedFont;
  }
});
