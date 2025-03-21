class Foo:
    inputs = ()
    outputs = ({"name": "FooOutput", "type": "STRING"}, {"name": "FooOutput2", "type": "STRING"},)
    def __init__(self):
        self.instantiated = True
        # print("Foo initialized")
        self.output_results = []

    def run(self):
        self.output_results = []
        # print("Foo running")
        self.output_results.append("FooOutput")
        self.output_results.append("FooOutput2")
        # return "FooOutput", "FooOutput2"

class Bar:
    inputs = ({"name": "BarInput", "type": "STRING"}, {"name": "BarInput2", "type": "STRING"})
    outputs = ({"name": "BarOutput", "type": "STRING"},)
    def __init__(self):
        self.instantiated = True
        # print("Bar initialized")

    def run(self, x, y):
        print(f"X: {x} Y: {y}")
        # print("Bar running")
        return "BarOutput"

