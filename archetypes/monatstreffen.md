---
title: "{{ replace (replaceRE "([0-9]{4})-?(1[0-2]|0[1-9])-?(3[01]|0[1-9]|[12][0-9])-?" "" .Name 1) "-" " " | title }}"
date: {{ index (findRE "([0-9]{4})-?(1[0-2]|0[1-9])-?(3[01]|0[1-9]|[12][0-9])" .Name 1) 0}}
draft: true
---
Das ist ein Monatstreffen.