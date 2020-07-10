## Protoc Parser

Take a Deno.Reader containing the [Google Protocol Buffer DSL](https://developers.google.com/protocol-buffers/docs/proto3) and convert it into a set of AST nodes which can be traversed and manipulated, and converted into JSON or back into the Protocol Buffer DSL.

### Usage

```typescript
import {parse} from 'https://deno.land/x/protoc_parser/mod.ts'

const file = Deno.open('./my-file.proto')
try {
  const proto = parse(file)
  proto.accept(class {
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

