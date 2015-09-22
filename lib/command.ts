import util = require("util");

export class Command implements Operation {
  summary: string = "UNSET!"
	
  execute(project, kube) {
    // TODO: make this abstract once VSCode gets proper TS 1.6 support
  }
}
