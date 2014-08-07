var api = {};
(function(api, core) {
    function Lifecycle(definiton) {
        this.definition = definiton;
    }
    Lifecycle.prototype.getName = function() {
        if (!this.definition.name) {
            throw 'Unable to locate name attribute in the lifecycle definition ';
        }
        return this.definition.name;
    };
    /**
     * The function will obtain the next state of states from the current state
     * @return An array containing the name of the next set of states
     */
    Lifecycle.prototype.nextStates = function(currentStateName) {
        var states = this.definition.configuration.lifecycle.scxml.state;
        var nextStates = [];
        if (!states) {
            throw 'The lifecycle : ' + this.getName() + ' does not have any state information.Make sure that the states are defined in the scxml definition.';
        }
        if (!states[currentStateName]) {
            log.warn('The state: ' + currentStateName + ' is not present in the lifecycle: ' + this.getName());
            return nextStates;
        }
        if (!states[currentStateName].transition) {
            log.warn('The state: ' + currentStateName + ' has not defined any transitions in the lifecycle: ' + this.getName());
            return nextStates;
        }
        var transitions = states[currentStateName].transition;
        for (var index = 0; index < transitions.length; index++) {
            var transition = {};
            transition.state = transitions[index].target;
            transition.action = transitions[index].event;
            nextStates.push(transition);
        }
        return nextStates;
    };
    /**
     * The function returns details about the current state
     * @param  {[type]} name The name of the state
     * @return A json object representing the state
     */
    Lifecycle.prototype.state = function(name) {};
    /**
     * The function returns the action that can cause transitions from the fromState to the toState
     * @param  {[type]} fromState The from state
     * @param  {[type]} toState   [description]
     * @return {[type]}           [description]
     */
    Lifecycle.prototype.transitionAction = function(fromState, toState) {
        //Get the list of states that can be reached from the fromState
        var states = this.nextStates(fromState);
        if (states.length) {
            log.warn('There is no way to move from ' + fromState + ' to ' + toState + ' in lifecycle: ' + this.getName());
            return null;
        }
        for (var index = 0; index < states.length; index++) {
            if (states[index].state == toState) {
                return states[index].action;
            }
        }
        log.warn('There is no transition action to move from ' + fromState + ' to ' + toState + ' in lifecycle: ' + this.getName());
        return null;
    };
    // var getTenantId = function(session) {
    //     var server = require('store').server;
    //     var user = server.current(session);
    //     return user.tenantId;
    // };
    api.getLifecycle = function(lifecycleName, tenantId) {
        if (!tenantId) {
        	throw 'Unable to locate lifecycle '+lifecycleName+' without a tenantId';
        }
        var lcJSON = core.getJSONDef(lifecycleName, tenantId);
        if (!lcJSON) {
            log.warn('Unable to locate lifecycle ' + lifecycleName + ' for the tenant: ' + tenantId);
            return null;
        }
        return new Lifecycle(lcJSON);
    };
}(api, core));