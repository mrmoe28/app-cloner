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
        - generic [ref=e13]:
          - button "Sign In" [ref=e14] [cursor=pointer]:
            - img
            - text: Sign In
          - button "Toggle menu" [ref=e15] [cursor=pointer]:
            - img
            - generic [ref=e16] [cursor=pointer]: Toggle menu
    - main [ref=e17]:
      - generic [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e21]: Welcome to App Cloner
          - generic [ref=e22]: Sign in to view your projects and start cloning app interfaces
        - button "Sign In" [ref=e24] [cursor=pointer]:
          - img
          - text: Sign In
  - region "Notifications (F8)":
    - list
  - button [ref=e26] [cursor=pointer]:
    - img
  - button "Open Next.js Dev Tools" [ref=e33] [cursor=pointer]:
    - img [ref=e34] [cursor=pointer]
  - alert [ref=e38]
```