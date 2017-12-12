import {connect} from 'react-redux';

export default (getModule, component) => {

  const getMapStateToProps = (component, module) => module ? component.mapStateToProps || module.defaultMapStateToProps : () => ({});
  const getMapDispatchToProps = (component, module) => module ? component.mapDispatchToProps || module.defaultMapDispatchToProps : () => ({});

  const mapStateToProps = (state, ownProps) => {
    const module = getModule();
    return getMapStateToProps(component, module)({
      ownProps,
      ...module.getStateConsumptionHelpers(() => state)
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
