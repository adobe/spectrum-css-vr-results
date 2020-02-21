FROM alpine:latest

LABEL repository="https://github.com/adobe/spectrum-css-vr-results"
LABEL homepage="https://github.com/adobe/spectrum-css-vr-results"
LABEL "com.github.actions.name"="Automatic gh-pages Branch Merge"
LABEL "com.github.actions.description"="Automatically merge your orphan branch to gh-pages."
LABEL "com.github.actions.icon"="git-merge"
LABEL "com.github.actions.color"="blue"

RUN apk --no-cache add jq bash curl git

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]