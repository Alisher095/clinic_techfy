from fastapi import APIRouter, WebSocket

from app.core.websocket import ws_manager

router = APIRouter()


@router.websocket("/ws/alerts")
async def alerts_ws(websocket: WebSocket) -> None:
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    finally:
        await ws_manager.disconnect(websocket)
