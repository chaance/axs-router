import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { BaseContext } from '../lib/context';
import { insertParams, resolve } from '../lib/path';
import { redirectTo } from '../lib/redirect';
import Location from './Location';

function RedirectImpl({
  navigate,
  to,
  from,
  replace = true,
  state,
  noThrow,
  baseuri,
  ...props
}) {
  useEffect(() => {
    Promise.resolve().then(() => {
      let resolvedTo = resolve(to, baseuri);
      navigate(insertParams(resolvedTo, props), {
        replace,
        state,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let resolvedTo = resolve(to, baseuri);
  if (!noThrow) redirectTo(insertParams(resolvedTo, props));
  return null;
}

function Redirect(props) {
  const { baseuri } = useContext(BaseContext);
  return (
    <Location>
      {locationContext => (
        <RedirectImpl {...locationContext} baseuri={baseuri} {...props} />
      )}
    </Location>
  );
}

Redirect.displayName = 'Redirect';
if (__DEV__) {
  Redirect.propTypes = {
    from: PropTypes.string,
    to: PropTypes.string.isRequired,
  };
}

export default Redirect;
