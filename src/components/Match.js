import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { match, resolve } from '../lib/path';
import { BaseContext } from '../lib/context';
import Location from './Location';

function Match({ path, children }) {
  const { baseuri } = useContext(BaseContext);
  return (
    <Location>
      {({ navigate, location }) => {
        let resolvedPath = resolve(path, baseuri);
        let result = match(resolvedPath, location.pathname);
        return children({
          navigate,
          location,
          match: result
            ? {
                ...result.params,
                uri: result.uri,
                path,
              }
            : null,
        });
      }}
    </Location>
  );
}

if (__DEV__) {
  Match.propTypes = {
    path: PropTypes.string,
  };
}

Match.displayName = 'Match';

export default Match;
