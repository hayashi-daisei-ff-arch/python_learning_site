export const templates = {
    calc: `a = 10
b = 5
c = a + b
print(c)
d = c * 2
print(d)`,

    if: `score = 85
if score >= 80:
    print("Excellent")
if score < 60:
    print("Study more")`,

    while: `count = 0
while count < 3:
    print(count)
    count = count + 1
print("Done")`,

    for: `numbers = [1, 2, 3]
for n in numbers:
    print(n * 2)
print("Loop finished")`,

    list: `fruits = ["apple", "banana"]
print(fruits)
numbers = [10, 20, 30]
total = numbers[0] + numbers[1] + numbers[2]
print(total)`,

    string: `name = "太郎"
greeting = "こんにちは"
message = greeting + name
print(message)
age = 20
print(age)`,

    cast: `x = 3.14
print(x)
y = int(x)
print(y)
z = str(y)
print(z)
text = "123"
num = int(text)
print(num + 10)`
};
