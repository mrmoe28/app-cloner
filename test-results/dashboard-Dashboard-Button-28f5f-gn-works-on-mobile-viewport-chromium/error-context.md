# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - link "App Cloner" [ref=e6] [cursor=pointer]:
          - /url: /
          - img [ref=e8] [cursor=pointer]
          - generic [ref=e12] [cursor=pointer]: App Cloner
        - button "Toggle menu" [ref=e15] [cursor=pointer]:
          - img
          - generic [ref=e16] [cursor=pointer]: Toggle menu
    - main [ref=e17]:
      - img [ref=e20]
  - region "Notifications (F8)":
    - list
  - button [ref=e23] [cursor=pointer]:
    - img
  - button "Open Next.js Dev Tools" [ref=e30] [cursor=pointer]:
    - img [ref=e31] [cursor=pointer]
  - alert [ref=e34]
```