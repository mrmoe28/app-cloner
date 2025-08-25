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
        - navigation [ref=e13]:
          - link "Dashboard" [ref=e14] [cursor=pointer]:
            - /url: /dashboard
            - text: Dashboard
          - link "New Project" [ref=e15] [cursor=pointer]:
            - /url: /create
            - text: New Project
    - main [ref=e18]:
      - img [ref=e21]
  - region "Notifications (F8)":
    - list
  - button [ref=e24] [cursor=pointer]:
    - img
  - button "Open Next.js Dev Tools" [ref=e31] [cursor=pointer]:
    - img [ref=e32] [cursor=pointer]
  - alert [ref=e35]
```