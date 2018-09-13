import React from 'react';
import {HistoryContext} from './navigation';

export default ({to, ...props}) => <HistoryContext.Consumer>
  {({history}) => <a href={to} {...props} onClick={e => {
    e.preventDefault();
    history.push(to);
    props.onClick && props.onClick(e);
  }} />}
</HistoryContext.Consumer>;
