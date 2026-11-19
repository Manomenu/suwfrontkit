# Decisions above one component

A decision normally lives in the spec of the feature it concerns, as one sentence in its
"Decisions" section: what was chosen and why not otherwise. A decision that spans several
components (how the package is distributed, a token scheme, a library every component uses) lives here
instead, one file per decision, and the specs link to it.

A file is never edited: a change of mind is a new file that names the one it supersedes.
"Why it used to be Y" is knowledge too.

Name: a four-digit number, then what was decided. Content: the context, the options weighed, the choice, its
consequences; half a page, dated.
