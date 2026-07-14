# Kanyō Viewer — description

The public web viewer for Kanyō — live streams, recorded falcon arrival and departure clips, event timelines, and visit statistics — the frontend companion to the detection pipeline.

Kanyō watches the cameras; the Viewer is how people watch what Kanyō found. It consumes the event data and media the detection pipeline produces and presents them through a responsive interface: live YouTube embeds, an HKSV-style horizontal timeline with time-positioned thumbnails, week-based date navigation, visit statistics over configurable ranges, and direct download and share links for individual clips. A FastAPI backend indexes event metadata from JSON and serves video and image assets with path-traversal protection; the frontend handles dual-timezone display, clip playback, and touch-optimized scrolling. It is the bonded sub-peak of Kanyō — a separate application, but one that means anything only because of the system it renders. It runs in production at kanyo.sageframe.net.

React 19 with Vite, React Router, Tailwind CSS v4, and hls.js on the frontend; FastAPI on Python 3.11 on the backend; deployed via Docker and Cloudflare Tunnel.
