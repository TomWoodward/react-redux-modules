import {connect} from 'react-redux';
import Module from './Module';

export default (module, component) => {
  const getModule = module instanceof Module
    ? () => module
    : module;

  const getMapStateToProps = (component, module) => module ? component.mapStateToProps || module.defaultMapStateToProps : () => ({});
  const getMapDispatchToProps = (component, module) => module ? component.mapDispatchToProps || module.defaultMapDispatchToProps : () => ({});

  const mapStateToProps = (state, ownProps) => {
    const module = getModule();

    return getMapStateToProps(component, module)({
      ownProps,
      ...module.getStateConsumptionHelpers(state)
    });
  };
  const mapDispatchToProps = (dispatch, ownProps) => {
    const module = getModule();
    return getMapDispatchToProps(component, module)({
      ownProps,
      ...module.getStateModificationHelpers(dispatch)
    });
  };

  return connect(mapStateToProps, mapDispatchToProps)(component);
}
