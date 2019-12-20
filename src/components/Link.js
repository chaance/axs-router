/* eslint-disable jsx-a11y/anchor-has-content */
import React, { forwardRef, useContext } from 'react';
import PropTypes from 'prop-types';
import { noop, shallowCompare, shouldNavigate, startsWith } from '../lib/utils';
import { resolve } from '../lib/path';
import { BaseContext } from '../lib/context';
import Location from './Location';

const Link = forwardRef(function Link({ innerRef, ...props }, ref) {
  const { baseuri } = useContext(BaseContext);
  return (
    <Location>
      {({ location, navigate }) => {
        let { to, state, replace, getProps = noop, ...anchorProps } = props;
        let href = resolve(to, baseuri);
        let encodedHref = encodeURI(href);
        let isCurrent = location.pathname === encodedHref;
        let isPartiallyCurrent = startsWith(location.pathname, encodedHref);

        return (
          <a
            ref={ref || innerRef}
            aria-current={isCurrent ? 'page' : undefined}
            {...anchorProps}
            {...getProps({ isCurrent, isPartiallyCurrent, href, location })}
            href={href}
            onClick={event => {
              if (anchorProps.onClick) anchorProps.onClick(event);
              if (shouldNavigate(event)) {
                event.preventDefault();
                let shouldReplace = replace;
                if (typeof replace !== 'boolean' && isCurrent) {
                  const { key, ...restState } = { ...location.state };
                  shouldReplace = shallowCompare({ ...state }, restState);
                }
                navigate(href, {
                  state,
                  replace: shouldReplace,
                });
              }
            }}
          />
        );
      }}
    </Location>
  );
});

Link.displayName = 'Link';
if (__DEV__) {
  Link.propTypes = {
    to: PropTypes.string.isRequired,
  };
}

export default Link;
