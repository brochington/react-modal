var React = require('react');
var ReactDOM = require('react-dom');
var ExecutionEnvironment = require('exenv');
var ModalPortal = React.createFactory(require('./ModalPortal'));
var ariaAppHider = require('../helpers/ariaAppHider');
var elementClass = require('element-class');
var renderSubtreeIntoContainer = require("react-dom").unstable_renderSubtreeIntoContainer;

var SafeHTMLElement = ExecutionEnvironment.canUseDOM ? window.HTMLElement : {};

var Modal = module.exports = React.createClass({

  displayName: 'Modal',
  statics: {
    setAppElement: ariaAppHider.setElement,
    injectCSS: function() {
      "production" !== process.env.NODE_ENV
        && console.warn('React-Modal: injectCSS has been deprecated ' +
                        'and no longer has any effect. It will be removed in a later version');
    }
  },

  propTypes: {
    isOpen: React.PropTypes.bool.isRequired,
    style: React.PropTypes.shape({
      content: React.PropTypes.object,
      overlay: React.PropTypes.object
    }),
    appElement: React.PropTypes.instanceOf(SafeHTMLElement),
    onRequestClose: React.PropTypes.func,
    closeTimeoutMS: React.PropTypes.number,
    ariaHideApp: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      isOpen: false,
      ariaHideApp: true,
      closeTimeoutMS: 0
    };
  },

  childContextTypes: {
    beforeModalDidMount: React.PropTypes.func,
    beforeModalWillUnmount: React.PropTypes.func
  },

  getChildContext: function() {
    return {
      beforeModalDidMount: this.beforeModalDidMount,
      beforeModalWillUnmount: this.beforeModalWillUnmount
    }
  },

  beforeModalDidMountCallbacks: [],
  beforeModalUmountsCallbacks: [],

  beforeModalDidMount: function(func) {
    console.log("beforeModalDidMount!!");
    if (func) {
      var newCallbacks = this.beforeModalDidMountCallbacks.concat(typeof func === 'array' ? func : [func]);

      this.beforeModalDidMountCallbacks = newCallbacks;
    }
  },

  beforeModalWillUnmount: function(func) {
      console.log("beforeModalWillUnmount");
      if (func) {
        var newCallbacks = this.beforeModalUmountsCallbacks.concat(typeof func === 'array' ? func : [func]);

        this.beforeModalUmountsCallbacks = newCallbacks;
      }
  },

  componentDidMount: function() {
    console.log("Modal componentDidMount");
    this.beforeModalDidMountCallbacks.map(function(cb){
        cb();
    });

    this.node = document.createElement('div');
    this.node.className = 'ReactModalPortal';
    document.body.appendChild(this.node);
    this.renderPortal(this.props);
  },

  componentWillReceiveProps: function(newProps) {
    this.renderPortal(newProps);
  },

  componentWillUnmount: function() {
    console.log("Modal componentWillUnmount");
    this.beforeModalUmountsCallbacks.map(function(cb){
        cb();
    });
    
    ReactDOM.unmountComponentAtNode(this.node);
    document.body.removeChild(this.node);
  },

  renderPortal: function(props) {
    if (props.isOpen) {
      elementClass(document.body).add('ReactModal__Body--open');
    } else {
      elementClass(document.body).remove('ReactModal__Body--open');
    }

    if (props.ariaHideApp) {
      ariaAppHider.toggle(props.isOpen, props.appElement);
    }
    sanitizeProps(props);
    this.portal = renderSubtreeIntoContainer(this, ModalPortal(props), this.node);
  },

  render: function () {
    return React.DOM.noscript();
  }
});

function sanitizeProps(props) {
  delete props.ref;
}
