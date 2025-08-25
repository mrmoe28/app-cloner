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
        - button "Sign In" [ref=e17] [cursor=pointer]:
          - img
          - text: Sign In
    - main [ref=e18]:
      - generic [ref=e20]:
        - generic [ref=e21]:
          - generic [ref=e22]: Welcome to App Cloner
          - generic [ref=e23]: Sign in to view your projects and start cloning app interfaces
        - button "Sign In" [ref=e25] [cursor=pointer]:
          - img
          - text: Sign In
  - region "Notifications (F8)":
    - list
  - button [ref=e27] [cursor=pointer]:
    - img
  - button "Open Next.js Dev Tools" [ref=e34] [cursor=pointer]:
    - img [ref=e35] [cursor=pointer]
  - alert [ref=e38]
```