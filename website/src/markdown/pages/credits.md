# Credits and Trade-offs

## Credits

### @reach/router

TODO

### Gatsby, Fable Tech Labs, and Marcy Sutton

TODO

https://www.gatsbyjs.org/blog/2019-07-11-user-testing-accessible-client-routing/


## Trade-offs (mostly compared to React Router)

* Size. I'm aiming to come in under 4kb for a modern React app. That makes some extra features harder to include, and I do not plan to support versions of React older than 16.8.

* No complex route patterns. There are no optional params, or anything like them, it's just static paths, params, and trailing wildcard.

* No history blocking.

* No React Native support. Designed for the DOM and that's very likely to always be the case.
