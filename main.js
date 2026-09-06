
/**
 * Converts an ASCII character to its decimal value
 * 
 * Converts a number input from one base to another base.. eg: base 2 to base 10
 * 
 * Reads an image and outputs the pixel values into a txt file
 *
 * Creates an Image using hexvalues from a txt structured like a 2d array, it can read txt files it makes
 * 
 * Execute manages the functions
 * 
 *
 *
 * must run npm install img-js in your terminal in order for image methods to work locally
 */
import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { writeFile } from "node:fs/promises";
import { decode, Image, write } from "image-js";




// Color Functions
const hexConversion = (r, g, b, a)  => {
    if (r.length === 1)
        r = "0" + r;
    if (g.length === 1)
        g = "0" + g;
    if (b.length === 1)
        b = "0" + b;

    return "#" + r + g + b;
}

function hexToRGB(hex) {
    let r = "0x" + hex[1] + hex[2],
        g= "0x" + hex[3] + hex[4],
        b = "0x" + hex[5] + hex[6];

    return [
        parseInt(r, 16),
        parseInt(g, 16),
        parseInt(b,16),
    ]
}

//

//Functions for Assignment

function asciiToDec(char){
    return char.charCodeAt(0);
}


function numberConversion(fromBase, toBase, value){
    if(isNaN(parseInt(value)) || isNaN(parseInt(fromBase)) || isNaN(parseInt(toBase))){
        return ("Invalid input");
    }
    const base = +fromBase;

    let decimalNumber = parseInt(value, base);
    if(isNaN(decimalNumber)){
        return "If converting from base 2, must use binary as input"
    }
    let result = decimalNumber.toString(toBase);
    return "From Base" + fromBase + " to Base" + toBase + "\nConverted value: " + result;
}


async function readImage(path){

    try{
        const imageData = await readFile(path);
        const img = decode(imageData);
        const output = [];

        for(let y = 0; y < img.height; y++){
            output[y] = [];
            for(let x = 0; x < img.width; x++){

                let pixel = img.getPixel(x, y);
                if(pixel[3] === undefined){
                    output[y][x] = hexConversion(pixel[0].toString(16),
                        pixel[1].toString(16),
                        pixel[2].toString(16));
                }
                else{
                    output[y][x] = hexConversion(pixel[0].toString(16),
                        pixel[1].toString(16),
                        pixel[2].toString(16),
                        pixel[3].toString(16));
                }


            }
        }

        await writeFile("awesomeFile.txt", output.join("\n"), "utf8");
        return "File writing in progress."
    } catch(error){
        return "File not found"
    }

}


async function createImage(inputPath, outputPath) {
    try{
        const text = await readFile(inputPath, "utf8");
        const hexValues = []
        const rows = text.split('\n');
        const width = rows[0].split(",").length
        const height = rows.length;

        //This takes the 2D array that the read function generates and puts it into one single array
        for(let i = 0; i < rows.length; i++){
            let arr = rows[i].split(",");
            for(let j = 0; j < arr.length; j++){
                hexValues.push(arr[j])
            }
        }

        const image = new Image(width, height, {
            colorModel: "RGB",
            bitDepth: 8
        });

        for (let i = 0; i < hexValues.length; i++) {
            const x = i % width;
            const y = Math.floor(i / width);
            const rgb = hexToRGB(hexValues[i]);
            image.setPixel(x, y, rgb);
        }

        await write(outputPath, image);

        return "Image being created: ${outputPath}";
    }catch(e){
        return "There was an error"
    }

}


const execute = async () => {

    let condition = 0;
    let output;

    const inputStruc = createInterface({
        input: stdin,
        output: stdout
    });


    let response = await inputStruc.question("What would you like to do? (Enter the number of the option): ");
    if(isNaN(response)){
        console.log("Invalid input");
        inputStruc.close()
        return;
    }
    condition = parseInt(response);


    switch(condition){

        case 1:
            output = await inputStruc.question("Enter an ASCII character: ");
            inputStruc.close();
            return asciiToDec(output);
        case 2:
            let fromBase = await inputStruc.question("Enter the base you want to convert from: ");
            let toBase = await inputStruc.question("Enter the base you want to convert to: ");
            let value = await inputStruc.question("Enter the value you want to convert: ");
            inputStruc.close();
            return numberConversion(fromBase, toBase, value);
        case 3:
            const path = await inputStruc.question("Input image path: ");
            inputStruc.close();
            return await readImage(path);
        case 4:
            let inPath = await inputStruc.question("Input image source path: ");
            let outPath = await inputStruc.question("Input destination path and extension eg.. .png, .jpg: ");
            inputStruc.close();
            return await createImage(inPath, outPath);
        default:
            inputStruc.close();
            return 5;

    }
}

async function run(){

    const options = [
        {   key : 1,
            method : "Convert ASCII to Decimal",
        },
        {   key : 2,
            method : "Convert Number from one base to another",
        },
        {   key : 3,
            method : "Read an image and output pixel values into a txt file",
        },
        {   key : 4,
            method : "Create an image from pixel values",
        },
        {   key : 5,
            method : "Exit",
        }
    ]
    
    console.log("Welcome to the HW1 tool\nHere is what is available:");
    options.map((value)=>{
        console.log(value.key + ". " + value.method);
    })


    let output = null;

    while(output !== 5){
        output = await execute();
        console.log(output);
    }
    // Terminates the script by throwing an error, in case you were wondering
    throw 'Terminating...';
}


run()