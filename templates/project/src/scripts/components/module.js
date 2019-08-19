'use strict';

export default class ClassTest {
    constructor( user = 'there' ) {
        this.message = 'Hi ' + user + ', Welcome to new Project!';
        this.hi();
    }
    hi() {
        console.warn( this.message );
    }
}
