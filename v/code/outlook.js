//
//Resolve the schema classes, viz.:database, columns, mutall e.t.c.
import * as schema from "../../../schema/v/code/schema.js";
//
//
import * as server from '../../../schema/v/code/server.js';
//A view is the home of all methods that need to be accessible from
//the fron end.
export class view {
    url;
    //
    //This is used for indexing a view object to support implementation of the
    //static 'current' property, as well as associateing this view with a state
    //object in the management of sessions. It is set when this view is
    //constructed. See onpopstate
    key;
    //
    //Lookup storage for all views created by this application.
    static lookup = new Map();
    //
    //The current active view where the events (on a html page) are wired. E.g.
    //<button onclick=view.current.open_dbase()>Ok</button>
    static current;
    //
    //A view is associated with a win property. Typically it is the current
    //window, when the view is created. This variable is protected so that
    //it accessible only via getters and setters. This is important because
    //other derivatives of this class access the window property in different
    //ways. For instance, a baby page gets its window from its mother
    win__ = window;
    //
    //These are getter and setter to access the protected win variable. See
    //documention for propertu win__ above to appreciate the reason for using
    //of getters and setters in derived classes
    get win() { return this.win__; }
    set win(win) { this.win__ = win; }
    //
    //The document of a view is that of its the window
    get document() {
        return this.win.document;
    }
    //
    //Friendly id of a view, for debugging purposes.
    id = 'view';
    //
    //The children nodes of the root document element of this page
    //to support restoring of this page in response to the on pop state event.
    //The ordinary programmer is not expected to interact with this property,
    //so it is protected
    child_nodes = [];
    //
    constructor(
    //
    //The address  of the page. Some popup pages don`t have
    //a url that`s why it`s optional.
    url) {
        this.url = url;
        //
        //Register this view identified by the last entry in the lookup table for views.
        //
        //The view's key is the count of the number of keys in the lookup.
        this.key = view.lookup.size;
        view.lookup.set(this.key, this);
    }
    //Returns the values of the currently selected inputs
    //from a list of named ones
    get_input_choices(name) {
        //
        //Collect the named radio/checked inputs
        const radios = Array.from(this.document.querySelectorAll(`input[name="${name}"]:checked`));
        //
        //Map teh selected inputs to thiier values and return the collection
        return radios.map(r => r.value);
    }
    //Returns the value from an identified input or textarea element.
    //The function will fail if there is no input value.
    get_input_value(id) {
        //
        //Get the identified element.
        const elem = this.get_element(id);
        //
        //It must be an input  element or textarea.
        if (!(elem instanceof HTMLInputElement || elem instanceof HTMLTextAreaElement))
            throw new schema.mutall_error(`'${id}' is not an input or textarea element`);
        //
        //There must be a value in the element.
        if (elem.value === "")
            throw new schema.mutall_error(`No value found for element '${id}'`);
        // 
        //Return the input element value.
        return elem.value;
    }
    //
    //Returns the value of the checked radio button that have this given name.
    //There must be atleast one checked value.
    get_checked_value(name) {
        //
        //Get the radio button that is checked.
        const radio = document.querySelector(`input[name='${name}']:checked`);
        //
        //There must be atleast one checked value under the given name.
        if (radio === null)
            alert(`No checked value found under this name '${name}'`);
        //
        //Ensure that the radio element is a HTMLInputElement.
        if (!(radio instanceof HTMLInputElement))
            throw new schema.mutall_error(`The input named '${name}' is not a HTMLInputElement`);
        //
        //The radio button value must be set.
        if (radio.value === "")
            throw new schema.mutall_error(`No value found for input named '${name}'`);
        //
        //Return the checked value.
        return radio.value;
    }
    //
    //Get the selected value from the identified selector.
    //There must be a selected value.
    get_selected_value(id) {
        //
        //Get the Select Element identified by the id.
        const select = this.get_element(id);
        //
        //Ensure that the select is a HTMLSelectElement.
        if (!(select instanceof HTMLSelectElement))
            throw new schema.mutall_error(`The element identified by '${id}' is not a HTMLSelectElement.`);
        //
        //Ensure that the select element value is set.
        if (select.value === "")
            throw new schema.mutall_error(`The value of the select element identified by '${id}' is not set.`);
        //
        //Return the selected value
        return select.value;
    }
    //
    //Create a new element from  the given tagname and attributes
    //we assume that the element has no children in this version.
    create_element(
    //
    //The parent of the element to be created
    anchor, 
    //
    //The elements tag name
    tagname, 
    //
    //The attributes of the element
    attributes) {
        //
        //Create the element holder based on the td's owner documet
        const element = anchor.ownerDocument.createElement(tagname);
        //
        //Attach this element to the anchor
        anchor.appendChild(element);
        //
        //Loop through all the keys to add the atributes
        for (let key in attributes) {
            const value = attributes[key];
            //
            // JSX does not allow class as a valid name
            if (key === "className") {
                //
                //Take care of multiple class values
                const classes = (value).split(" ");
                classes.forEach((c) => element.classList.add(c));
            }
            else if (key === "textContent") {
                element.textContent = value;
            }
            else if (key.startsWith("on") && typeof attributes[key] === "function") {
                element.addEventListener(key.substring(2), value);
            }
            else {
                // <input disable />      { disable: true }
                if (typeof value === "boolean" && value) {
                    element.setAttribute(key, "");
                }
                else {
                    //
                    // <input type="text" />  { type: "text"}
                    element.setAttribute(key, value);
                }
            }
        }
        return element;
    }
    //
    //Return the identified element
    get_element(id) {
        //
        //Get the identified element from the current browser context.
        const element = this.document.querySelector(`#${id}`);
        //
        //Check the element for a null value
        if (element === null) {
            const msg = `The element identified by #${id} not found`;
            alert(msg);
            throw new Error(msg);
        }
        return element;
    }
    //Show or hide the identified a window panel. This method is typeically
    //used for showing/hiding a named grou of elements that must be shown
    //or hidden as required
    show_panel(id, show) {
        //
        //Get the identified element
        const elem = this.get_element(id);
        //
        //Hide the element if the show is not true
        elem.hidden = !show;
    }
}
//A page is a view with panels. It is an abstract class because
//the show panels method needs to be implemented by all classes
//that extend this one
export class page extends view {
    //
    //A page has named panels that the user must ensure that they
    //are set before are shown.
    panels;
    //
    constructor(url) {
        super(url);
        //
        //Initialize the panels dictionary
        this.panels = new Map();
    }
    //
    //The user must call this method on a new application object; its main
    //purpose is to complete those operations of a constructor that require
    //to function synchronously
    async initialize() {
        //
        //Set the window for this page
        this.win = await this.open();
        //
        //Add the pop state listener to ensure that if a history back button
        //is clicked on, we can restore this page
        this.win.onpopstate = (evt) => this.onpopstate(evt);
    }
    //Handle the on pop state listener by saving the current state and
    //restoring the view matching the event's history state
    onpopstate(evt) {
        //
        //Ignore any state that has no components to restore. Typically
        //this is the initial state placed automatically on the history
        //stack when this application loaded initially. For this version, the
        //null state is never expected because we did replace it in this
        //application's initializetion
        if (evt.state === null)
            throw new schema.mutall_error("Null state unexpected");
        //
        //Get the saved view's key
        const key = evt.state;
        //
        //Use the key to get the view being restored. We assume that it must be
        //a baby of the same type as this one
        const new_view = view.lookup.get(key);
        //
        //It is an error if the key has no matching view.
        if (new_view === undefined)
            throw new schema.mutall_error(`This key ${key} has no view`);
        //
        //Restore the components of the new view
        new_view.restore_view(key);
    }
    //Restore the children nodes of this view by re-attaching them to the
    //document element of this page's window.
    restore_view(key) {
        //
        //Get the view of the given key
        const View = view.lookup.get(key);
        //
        //It's an error if the view has not been cached
        if (View === undefined)
            throw new schema.mutall_error(`This key ${key} has no matching view`);
        //
        //Get the root document element.
        const root = View.document.documentElement;
        //
        //Clean the root before restoring it -- just in case the view
        //is attached to an old window;
        Array.from(root.childNodes).forEach(node => root.removeChild(node));
        //
        //Attach every child node of this view to the root document
        this.child_nodes.forEach(node => root.appendChild(node));
    }
    //Opening a page makes visible in the users view. All pages return the
    //current window. Only popups create new ones.
    async open() {
        return window;
    }
    //Remove a quiz page from a users view and wait for the base to rebuild.
    //In popups we simply close the window; in babies we do a history back,
    //and wait for the mother to be reinstated. In general, this does
    //nothing
    async close() { }
    //Save the children of the root document element of this view to the history
    //stack using the 'how' method
    save_view(how) {
        //
        //Get the root document element
        const root = this.document.documentElement;
        //
        //Save the child nodes to a local property
        this.child_nodes = Array.from(root.childNodes);
        //
        //Save (by either pushing or replacing) this view's state to the
        //windows session history indirectly -- indirectly because we don't
        //acutally save this view to the session history but its unique
        //identification key -- which then is used for looking up the view's
        //details from the static map, view.lookup
        this.win.history[how](
        //
        //The state object pushed (or replaced) is simply the key that
        //identifies this view in the static look for views, view.lookup
        this.key, 
        //
        //The title of this state. The documentation does not tell us what
        //it is really used for. Set it to empty
        "", 
        //
        //This browser bar info is not very helpful, so discard it
        "");
    }
    //Show the given message in a report panel
    async report(error, msg) {
        //
        //Get the report node element
        const report = this.get_element('report');
        //
        //Add the error message
        report.textContent = msg;
        //
        //Style the report, depending on the error status
        if (error) {
            report.classList.add('error');
            report.classList.remove('ok');
        }
        else {
            report.classList.add('ok');
            report.classList.remove('error');
        }
        //
        //Hide the go button
        const go = this.get_element('go');
        go.hidden = true;
        //
        //Change the value of the cancel button to finish
        const cancel = this.get_element('cancel');
        cancel.textContent = 'Finish';
        //
        //Wait for the user to close the merge operation
        await new Promise((resolve) => cancel.onclick = () => {
            this.close();
            resolve(null);
        });
    }
    //Fills the identified selector element with options fetched from the given
    //table name in the given database
    async fill_selector(ename, dbname, selectorid) {
        //
        //1. Get the selector options from the database
        const options = await server.exec("selector", [ename, dbname], "execute", []);
        //
        //2. Fill the selector with the options
        //
        //2.1. Get the selector element
        const selector = this.get_element(selectorid);
        //
        //2.2. Check if the selector is valid
        if (!(selector instanceof HTMLSelectElement))
            throw new Error(`The element identified by ${selectorid} is not valid`);
        //
        //2.3 Go through the options and populate the selector with the option elements
        for (let option of options) {
            //
            //2.3.1. Get the primary key from the option
            //
            //Formulate the name of the primary key.
            const key = `${ename}_selector`;
            //
            // const pk = option[key];
            const pk = option[key];
            //
            //2.3.2. Get the friendly component from the option
            const friend = option.friend__;
            //
            //Create the selector option.
            this.create_element(selector, 'option', { value: `${pk}`, textContent: `${friend}` });
        }
        return selector;
    }
}
//A panel is a targeted setction of a view. It can be painted
//independently
export class panel extends view {
    css;
    base;
    //
    //The panels target element is set (from css in the constructor arguments)
    // when the panel is painted
    target;
    //
    constructor(
    //
    //The CSS to describe the targeted element on the base page
    css, 
    //
    //The base view on that is the home of the panel
    base) {
        //The ur is that of the base
        super(base.url);
        this.css = css;
        this.base = base;
    }
    //
    //Start painting the panel
    async paint() {
        //
        //Get the targeted element. It must be only one
        const targets = Array.from(this.document.querySelectorAll(this.css));
        //
        //There must be a target
        if (targets.length == 0)
            throw new schema.mutall_error(`No target found with CSS ${this.css}`);
        //
        //Multiple targets is a sign of an error
        if (targets.length > 1)
            throw new schema.mutall_error(`Multiple targets found with CSS ${this.css}`);
        //
        //The target must be a html element
        if (!(targets[0] instanceof HTMLElement))
            throw new schema.mutall_error(`
        The element targeted by CSS ${this.css} must be an html element`);
        //
        //Set the html element and continue painting the panel
        this.target = targets[0];
        //
        //Continue to paint the pannel. This method is implemented differently
        //depending the obe extending class
        await this.continue_paint();
    }
    //
    //The window of a panel is the same as that of its base view,
    //so a panel does not need to be opened
    get win() {
        return this.base.win;
    }
}
//
//A quiz extends a view in that it is used for obtaining data from a user. The
//parameter tells us about the type of data to be collected. Baby and popup
//pages are extensions of a view.
export class quiz extends page {
    url;
    //
    //These are the results collected by this quiz.
    result;
    constructor(url) {
        super();
        this.url = url;
    }
    //To administer a (quiz) page is to  managing all the operations from
    //the  moment a page becomes visisble to when a result is returned and the
    //page closed. If successful a response (of the user defined type) is
    //returned, otherwise it is undefined.
    async administer() {
        //
        //Complete constrtuction of this class by running the asynchronous
        //methods
        await this.initialize();
        //
        //Make the logical page visible and wait for the user to
        //succesfully capture some data or abort the process.
        //If aborted the result is undefined.
        return await this.show();
    }
    //
    //This is the process which makes the page visible, waits for
    //user to respond and returns the expected response, if not aborted. NB. The
    //return data type is parametric
    async show() {
        //
        //Paint the full page. The next step for painting panels may need to
        //access elements created from this step. In a baby, this may involve
        //carnibalising a template; in a pop this does nothing
        await this.paint();
        //
        //Paint the various panels of this page in the default
        //way of looping over the panels. A page without the panels can
        //overide this method with its own.
        await this.show_panels();
        //
        //Wait for the user to ok or cancel this quiz, if the buttons are
        //provided
        const response = await new Promise(resolve => {
            //
            //Collect the result on clicking the Ok/go button.
            const okay = this.get_element("go");
            okay.onclick = async () => {
                //
                //Check the user unputs for errors. If there is
                //any, do not continue the process
                if (!await this.check())
                    return;
                //
                //Get the results
                const result = await this.get_result();
                //
                //Resolve the only when the result is ok
                resolve(result);
            };
            //
            //Discard the result on Cancel (by returning an undefined value).
            const cancel = this.document.getElementById("cancel");
            cancel.onclick = () => resolve(undefined);
        });
        //
        //Remove the popup window from the view (and wait for the mother to be
        //rebuilt
        await this.close();
        //
        //Return the promised result.
        return response;
    }
    //
    //Paint the full page. The next step for painting panels may need to
    //access elements crrated from this step. In a baby, this may involve
    //carnibalising a template; in a pop this does nothing
    async paint() { }
    ;
}
//
//The baby class models pages that share the same window as their mother.
//In contrast a popup does not(share the same window as the mother)
export class baby extends quiz {
    mother;
    //
    constructor(mother, url) {
        super(url);
        this.mother = mother;
    }
    //Paint the baby with with its html content (after saving the  mother's view)
    async paint() {
        //
        //Get the baby template
        const Template = new template(this.url);
        //
        //Open the template
        await Template.open();
        //
        //Replace the entire current document with that of the template
        this.document.documentElement.innerHTML = Template.win.document.documentElement.innerHTML;
        //
        //Close the baby template
        Template.win.close();
        //
        //Save this page's view, so that it can be resored when called upon
        //NB. The mother's view is already saved
        this.save_view("pushState");
    }
    //
    //The opening of returns the same window as the mother
    async open() { return this.mother.win; }
    //Close a baby page by invoking the back button; in contrast a popup does
    //it by executing the window close method.
    async close() {
        //
        return new Promise(resolve => {
            //
            //Prepare for the on=pop state, and resole when the mother has been
            //restored
            this.win.onpopstate = (evt) => {
                //
                //Attend to ompop state event, thus restoring the mother
                this.onpopstate(evt);
                //
                //Now stop waiting
                resolve();
            };
            //
            //Issue a history back command to evoke the on pop state
            this.win.history.back();
        });
    }
}
//A template is a popup window used for canibalising to feed another window.
//The way you open it is smilar to  popup. Its flagship method is the copy
//operation from one document to another
export class template extends view {
    url;
    //
    //A template must have a url
    constructor(url) {
        super(url);
        this.url = url;
    }
    //Open a window, by default, reurns the current window and sets the
    //title
    async open() {
        //
        //Open the page to let the server interprete the html
        //page for us. The window is temporary
        const win = window.open(this.url);
        //
        //Wait for the page to load
        await new Promise(resolve => win.onload = resolve);
        //
        //Retrieve the root html of the new documet
        this.win = win;
    }
    //
    //Transfer the html content from this view to the specified
    //destination and return a html element from the destination view.
    copy(src, dest) {
        //
        //Destructure the destination specification
        const [Page, dest_id] = dest;
        //
        //1 Get the destination element.
        const dest_element = Page.get_element(dest_id);
        //
        //2 Get the source element.
        const src_element = this.get_element(src);
        //
        //3. Transfer the html from the source to the destination. Consider
        //using importNode or adoptNode methods instead.
        dest_element.innerHTML = src_element.innerHTML;
        //
        //Return the destination painter for chaining
        return dest_element;
    }
}
//This class represents the view|popup page that the user sees for collecting
//inputs
export class popup extends quiz {
    specs;
    //
    constructor(url, 
    //
    //The popoup window size and location specification.
    specs) {
        super(url);
        this.specs = specs;
    }
    //
    //Open a pop window returns a brand new window with specified dimensions.
    async open() {
        //
        //Use the window size and location specification if available.
        const specs = this.specs === undefined ? this.get_specs() : this.specs;
        //
        //Open the page to let the server interprete the html
        //page for us.
        const win = window.open(this.url, "", specs);
        //
        //Wait for the window to load
        await new Promise(resolve => win.onload = () => resolve(win));
        //
        //Update this pop's win property
        return win;
    }
    //
    //Get the specifications that can center the page as a modal popup
    //Overide this method if you want different layout
    get_specs() {
        //
        //Specify the pop up window dimensions.
        //width
        const w = 500;
        //height
        const h = 500;
        //
        //Specify the pop up window position
        const left = screen.width / 2 - w / 2;
        const top = screen.height / 2 - h / 2;
        //
        //Compile the window specifictaions
        return `width=${w}, height=${h}, top=${top}, left=${left}`;
    }
    //Close this popup window
    async close() { this.win.close(); }
}
//
//The response you get using aa popup or an ordinary page
//export interface response { }
//
//
//Namespace for handling the roles a user plays in an application
export var assets;
(function (assets) {
    //Verbs for crud operations
    assets.all_verbs = ['create', 'review', 'update', 'delete'];
    ;
})(assets || (assets = {}));
//
//This is a generalised popup for making selections from multiple choices
//The choices are provided as a list of key/value pairs and the output is
//a list keys.
export class choices extends popup {
    inputs;
    id;
    css;
    type;
    //
    //These are the selected choices they are set during the check method
    //and returned at the get result. This property is private since its
    //value is only supposed to be retrieved using the get result method.
    output;
    //
    constructor(
    //
    //The html file to use for the popup
    filename, 
    //
    //The key value pairs that are to be painted as checkboxes
    //when we show the panels.
    inputs, 
    //
    //This is a short code that is used
    //as an identifier for this general popup
    id, 
    //
    //The popoup window size and location specification.
    specs, 
    //
    //The css that retrieves the element on this page where
    //the content of this page is to be painted. If this css
    //is not set the content will be painted at the body by default
    css = '#content', 
    //
    //Indicate whether multiple or single choices are expected
    type = 'multiple') {
        super(filename, specs);
        this.inputs = inputs;
        this.id = id;
        this.css = css;
        this.type = type;
    }
    //
    //Check that the user has selected  at least one of the choices
    async check() {
        //
        //Extract the marked/checked choices from the input checkboxes
        const result = this.get_input_choices(this.id);
        //
        //Cast this result into the desired output
        this.output = result;
        //
        //The ouput is ok if the choices are not empty.
        const ok = this.output.length > 0;
        if (!ok) {
            alert(`Please select at least one ${this.id}`);
            return false;
        }
        //
        return true;
    }
    //
    //Retrive the choices that the user has filled from the form
    async get_result() {
        return this.output;
    }
    //
    //Overide the show panels method by painting the css referenced element or
    //body of this window with the inputs that were used to create this page
    async show_panels() {
        //
        //Get the element where this page should paint its content,
        //this is at the css referenced element if given or the body.
        const panel = this.document.querySelector(this.css);
        if (panel === null)
            throw new schema.mutall_error("No hook element found for the choices");
        //
        //Attach the choices as the children of the panel
        this.inputs.forEach(option => {
            //
            //Destructure the choice item
            const { name, value } = option;
            //
            // Use radio buttons for single choices and checkbox for multiple
            // choices
            const type = this.type === 'single' ? "radio" : "checkbox";
            //
            // Compile the HTML option
            const html = `
                <label>
                 <input type='${type}' value= '${name}' name="${this.id}" >:
                 ${value}
                </label>`;
            //
            //Attach the label to the pannel
            const label = this.document.createElement("temp");
            panel.appendChild(label);
            label.outerHTML = html;
        });
    }
}
//
//This is a view displayed as a baby but not used for collecting data
//It is used in the same way that we use an alert and utilises the general
//html.
export class report extends baby {
    html;
    //
    //
    constructor(
    //
    //This popup parent page.
    mother, 
    //
    //The html text to report.
    html, 
    //
    //The html file to use
    filename) {
        //
        //The general html is a simple page designed to support advertising as
        //the user interacts with this application.
        super(mother, filename);
        this.html = html;
    }
    //
    //Reporting does not require checks and has no results to return because
    // it is not used for data entry.
    async check() { return true; }
    async get_result() { }
    //
    //Display the report
    async show_panels() {
        //
        //Get the access to the content panel and attach the html
        const content = this.get_element('content');
        //
        //Show the html in the content panel.
        content.innerHTML = this.html;
        //
        //Hide the go button from the general html since it is not useful in the
        //the reporting
        this.get_element("go").hidden = true;
    }
}
//
//A class to be implemented when creating a new class to avoid repetition.
//Once the class is called, one does not need to do anything else.
export class terminal extends baby {
    constructor(
    //
    //The mother view to the application.
    mother, 
    //
    //The html page to load
    html) {
        super(mother, html);
    }
    //
    //This method does nothing other than satisfying the contractual
    // obligation of a baby class.
    async get_result() {
        return true;
    }
}
//
//Represents a person/individual that is providing
//or consuming a services we are developing.
export class user {
    //
    //The provider supplied data
    name;
    //
    //The type of this user.
    //A user is a visitor if he has never been registered before
    //otherwise regular. This property is set on app.login
    type;
    //
    //Optional provider supplied data
    first_name;
    full_name;
    picture;
    //
    //These are the roles that this user plays in the application that he`s
    //logged in.
    role_ids;
    //
    //The products that this user is assigned to.
    products;
    //
    //The business
    business;
    //
    //The minimum requirement for authentication is a username and
    //password
    constructor(name = null) {
        //
        this.name = name;
    }
    //A user is a visitor if the name is not defined
    //otherwise his a regular user.
    is_visitor() {
        if (this.name === undefined)
            return true;
        else
            return false;
    }
}
