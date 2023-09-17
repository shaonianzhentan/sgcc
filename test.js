const { default: DdddOcr } = require('ddddocr')

console.log(DdddOcr)

const img = 'iVBORw0KGgoAAAANSUhEUgAAADwAAAAUCAIAAABeYcl+AAABfUlEQVR42uXWvU4CURAF4H0KY3gMg9R0WtPRUFnY0VhTWWhsSHwBiYkWhmBBS8ID2GyI8ADUtEqlTnKSyTB3dvYud0NC3JyGmwDfnT37k/0e4ZH9I/T49odylJMG/fD6eupxYL2N7p12KDHfv+ycyYA+yIcyvW6TohbNtBtXMg/DNf5l9byUSUKTMtxAOHig/Z/qXr+QUq6wm1NPPe6/v8zBq9pEosNFuPkj63fQ758tBJPmj06UW6HlpFlftIfQrdC1dZrQr6OcIvttoiXUdCs0NzsJPdm+OQ0hN8TYQIj2V0I3xP3NLHXS5FZ0Qi/yR4qcMc9+b7ScMblVdtDT7R2ltB6hG2LokZhJz+YfZiBWiyWTJndpp6Xb7LHcQPyknYsvth6YuuOmmGKz0/IMFKEhNm9/FTrNhYl5HHJOnm6Q+E5fnI/V4zD17gF6kd68q+BgvdyDcxCdU9u7RxE9vKuU7iFlA5nJ9a9Chx7/ClDpJCj9/u8eft2rHpX0f6CHJC8PoeyUAAAAAElFTkSuQmCC'

DdddOcr.create().then(async ddddocr => {
  const result = await ddddocr.classification(Buffer.from(img, "base64"));
  console.log(result)
})