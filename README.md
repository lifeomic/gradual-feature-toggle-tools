gradual-feature-toggle-tools
============================

A set of tools to make gradual rollout of features easier

Selecting users to get a feature
--------------------------------

When a new feature is being rolled out and is currently 50% enabled, then
ideally 50% of the users would get the new behavior. The enablement of the new
behavior should be uniform as the feature value is increased and should not be
biased by the usernames or feature names. For example, if you use e-mail
addresses then ideally the enablement of `@gmail.com` users would be evenly
spread across the range of enablement. The testcases assert that uniform
distribution is true.

Given a feature an a user, this code can help you decide whether a user should
receive the new behavior or not:

```
import { calculateUserEnablementThreshold } from 'gradual-feature-toggle-tools';

const featureValue = // some lookup of a feature's current value (from 0 - 100)
const userThreshold = await calculateUserEnablementThreshold('some-feature', 'some-user');
if (featureValue > userThredshold) {
    // Use the new behavior
} else {
    // Use the old behavior
}
```

