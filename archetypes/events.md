---
title: "{{ replace (replaceRE "([0-9]{4})-?(1[0-2]|0[1-9])-?(3[01]|0[1-9]|[12][0-9])-?" "" .Name 1) "-" " " | title }}"
# used for sorting probably the eventstart date
date: {{ index (findRE "([0-9]{4})-?(1[0-2]|0[1-9])-?(3[01]|0[1-9]|[12][0-9])" .Name 1) 0}}
# triggers publication, don't forget to regularly rebuild the website. Must be set if `date` is in the future or else 
# the event won't appear.
publishdate: {{ .Date }}
# start date of the event
eventstart: {{ index (findRE "([0-9]{4})-?(1[0-2]|0[1-9])-?(3[01]|0[1-9]|[12][0-9])" .Name 1) 0}}
# end date of the event
# eventend: 
# set categories to automagically replace placeholders.
categories:
#  - monatstreffen 
#  - freizeit
#  - convention-remote
#  - convention-local
#  - rollenspielabend

# when you feel ready, set to false. `hugo server -D` to show drafts locally.
draft: true
---

Das ist ein neues Event