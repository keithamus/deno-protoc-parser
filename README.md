## Protoc Parser

Take a Deno.Reader containing the [Google Protocol Buffer DSL](https://developers.google.com/protocol-buffers/docs/proto3) and convert it into a set of AST nodes which can be traversed and manipulated, and converted into JSON or back into the Protocol Buffer DSL.

See the [deno docs for more](https://doc.deno.land/https/deno.land/x/protoc_parser/mod.ts).

Note this project is not affiliated with Google or any other company.


### Example Usage

```typescript
import {parse} from 'https://deno.land/x/protoc_parser/mod.ts'

const file = Deno.open('./my-file.proto')
try {
  const proto = parse(file)
  proto.accept({
    visitMessage(messageNode) {
        // Do stuff with message node
    },
    visitService(serviceNode) {
        // Do stuff with service node
    }
    // etc
  })
} finally {
  file.close()
}
```

