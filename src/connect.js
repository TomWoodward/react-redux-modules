import {connect} from 'react-redux';

export default (getModule, component) => {

  const getMapStateToProps = (component, module) => module ? component.mapStateToProps || module.defaultMapStateToProps : () => ({});
  const getMapDispatchToProps = (component, module) => module ? component.mapDispatchToProps || module.defaultMapDispatchToProps : () => ({});

  const mapStateToProps = (...args) => {
    const module = getModule();
    return getMapStateToProps(component, module)(...args);
  };
  const mapDispatchToProps = (...args) => {
    const module = getModule();
    return getMapDispatchToProps(component, module)(...args);
  };

  return connect(mapStateToProps, mapDispatchToProps)(component);
}
