export const fetchWithProgress = async (
    fetchResponse: Promise<Response>,
    onGetChunk: (bytes: number, totalBytes: number) => void = (bytes, totalBytes) => {},
    totalBytes ?: number
    ): Promise<Response> => {
        return fetchResponse
            .then(response => {
                const reader = response.body!.getReader();
                const contentSize = totalBytes || Number(response.headers?.get('Content-Length')) || 0;
                let bytes = 0;
                return {
                    body:  new ReadableStream({
                        async start(controller) {
                            while (true) {
                                const {value, done} = await reader.read();
                                if (done || !value) {
                                    break;
                                }
                                bytes += value.length;
                                onGetChunk(bytes, contentSize);
                                controller.enqueue(value);
                            }

                            controller.close();
                            reader.releaseLock();
                        }
                    }),
                    init: {
                        headers: response.headers,
                        status: response.status,
                        statusText: response.statusText
                    }
                }
            })
            .then(({body, init}) => new Response(body, init))
    }
;