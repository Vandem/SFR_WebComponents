const template = document.createElement('template');
template.innerHTML = `
  <style>
    * { box-sizing: border-box; }
    body {
      font: 16px Arial;
    }
    .autocomplete {
      /*the container must be positioned relative:*/
      position: relative;
      display: inline-block;
    }
    input {
      border: 1px solid transparent;
      background-color: #f1f1f1;
      padding: 10px;
      font-size: 16px;
    }
    input[type=text] {
      background-color: #f1f1f1;
      width: 100%;
    }
    input[type=submit] {
      background-color: DodgerBlue;
      color: #fff;
    }
    .autocomplete-items {
      position: absolute;
      border: 1px solid #d4d4d4;
      border-bottom: none;
      border-top: none;
      z-index: 99;
      /*position the autocomplete items to be the same width as the container:*/
      // top: 100%;
      left: 0;
      right: 0;
    }
    .autocomplete-items div {
      padding: 10px;
      cursor: pointer;
      background-color: #fff;
      border-bottom: 1px solid #d4d4d4;
    }
    .autocomplete-items div:hover {
      /*when hovering an item:*/
      background-color: #e9e9e9;
    }
    .autocomplete-active {
      /*when navigating through the items using the arrow keys:*/
      background-color: DodgerBlue !important;
      color: #ffffff;
    }
  </style>

  <form autocomplete="off">
    <div class="autocomplete" style="width:300px;">
      <input id="autoCompleteInput" type="text" name="myCountry" placeholder="Country">
    </div>
    <input type="submit">
  </form>
  `

export class AutocompleteElement extends HTMLElement {
  public static observedAttributes = ['data-list'];

  inputElement: HTMLInputElement;
  list: string[];
  currentFocus;



  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    document.addEventListener("click", (e) => this.onBlur(e));
    this.inputElement = this.shadowRoot.getElementById('autoCompleteInput') as HTMLInputElement;
    this.inputElement.oninput = () => this.onInputChanged();
    this.inputElement.onkeydown = (e) => this.onKeyDown(e);
  }

  attributeChangedCallback(name: string, old: string, value: string) {
    this.list = JSON.parse(value)
    console.log(`Attribute ${name} value:`, this.list);
  }

  // autocomplete code and styling taken from https://www.w3schools.com/howto/howto_js_autocomplete.asp
  // adapted by Aljoscha Alquati
  onInputChanged() {
    var a, b, i, val = this.inputElement.value;
    /*close any already open lists of autocompleted values*/
    this.closeAllLists();
    if (!val) { return; }
    this.currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.shadowRoot.appendChild(a);
    /*for each item in the array...*/
    for (i = 0; i < this.list.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (this.list[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + this.list[i].substr(0, val.length) + "</strong>";
        b.innerHTML += this.list[i].substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + this.list[i] + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", (e) => this.onInputClick(e));
        a.appendChild(b);
      }
    }
  }

  onInputClick(e) {
    console.log("onInputClick()", e);
    /*insert the value for the autocomplete text field:*/
    this.inputElement.value = e.target.getElementsByTagName("input")[0].value;
    /*close the list of autocompleted values,
    (or any other open lists of autocompleted values:*/
    this.closeAllLists();
  }

  onKeyDown(e) {
    var x = this.shadowRoot.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div") as any;
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
      increase the currentFocus variable:*/
      this.currentFocus++;
      /*and and make the current item more visible:*/
      this.addActive(x);
    } else if (e.keyCode == 38) { //up
      /*If the arrow UP key is pressed,
      decrease the currentFocus variable:*/
      this.currentFocus--;
      /*and and make the current item more visible:*/
      this.addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (this.currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) x[this.currentFocus].click();
      }
    }
  }

  onBlur(e) {
    this.closeAllLists(e.target);
  }

  addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return;
    /*start by removing the "active" class on all items:*/
    this.removeActive(x);
    if (this.currentFocus >= x.length) this.currentFocus = 0;
    if (this.currentFocus < 0) this.currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[this.currentFocus].classList.add("autocomplete-active");
  }

  removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  closeAllLists(elmnt?) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = this.shadowRoot.querySelectorAll("div.autocomplete-items")
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != this.inputElement) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
}

customElements.define('auto-complete', AutocompleteElement);