// Dockerfile

function Image(project, pathname) {
    this.pathname = pathname;
}
// util.inherits(Image, Resource); // only once Kube resource concerns
// are factored out of Resource

module.exports = Image;
